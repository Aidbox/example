//
//  RNAppleHealth.swift
//
//  Created by Mikhail Poluboyarinov on 28/02/2019.
//  Copyright © 2019 Health Samurai. All rights reserved.
//

import Foundation
import HealthKit
import UIKit


@objc(RNAppleHealth)
class RNAppleHealth: NSObject {
  
  let null = NSNull.init()
  let store = HKHealthStore.init()
  let device = UIDevice.init()
  
  let ERR_TYPES_EMPTY = "Clinical record types are empty."
  let ERR_GRANT_ERROR = "The user didn't grant their access to clinical records."
  let ERR_WRONG_TYPE = "Wrong clinical record type."
  let ERR_UNAVAILABE = "The feature is unavailable on that device."
  
  func deviceId() -> String? {
    return device.identifierForVendor?.uuidString
  }
  
  func appVersion() -> String? {
    let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
    return version
  }
  
  
  func isHealthDataAvailable() -> Bool {
    return HKHealthStore.isHealthDataAvailable()
  }
  
  
  func isClinicalDataAvailable() -> Bool {
    if isHealthDataAvailable() {
      if #available(iOS 12.0, *) {
        return true
      }
    }
    return false
  }
  
  @objc
  func constantsToExport() -> [String: Any] {
    return [
      "appVersion": appVersion() ?? null,
      "deviceID": deviceId() ?? null,
      "isHealthDataAvailable": isHealthDataAvailable(),
      "isClinicalDataAvailable": isClinicalDataAvailable()
    ]
  }
  
  @objc(requestAuthorization:)
  func requestAuthorization(callback: @escaping RCTResponseSenderBlock) {
    let types = getTypes()
    if types.isEmpty {
      callback([ERR_TYPES_EMPTY, null])
      return
    }
    func requestHandler(success: Bool, error: Error?) {
      if success {
        callback([null, true])
        return
      }
      if let error = error {
        callback([error.localizedDescription, null])
        return
      }
      if !success {
        callback([ERR_GRANT_ERROR, null])
        return
      }
    }
    store.requestAuthorization(
      toShare: nil,
      read: Set(types.values),
      completion: requestHandler
    )
  }
  
  func getTypes() -> [String: HKObjectType] {
    var dict = [String: HKObjectType]()
    if #available(iOS 12.0, *) {
      dict["allergyRecord"]      = HKObjectType.clinicalType(forIdentifier: .allergyRecord) // Ready
      dict["conditionRecord"]    = HKObjectType.clinicalType(forIdentifier: .conditionRecord) // Ready
      dict["immunizationRecord"] = HKObjectType.clinicalType(forIdentifier: .immunizationRecord) // Ready
      dict["labResultRecord"]    = HKObjectType.clinicalType(forIdentifier: .labResultRecord) // Ready
      dict["medicationRecord"]   = HKObjectType.clinicalType(forIdentifier: .medicationRecord) // Ready
      dict["procedureRecord"]    = HKObjectType.clinicalType(forIdentifier: .procedureRecord) // Ready
      dict["vitalSignRecord"]    = HKObjectType.clinicalType(forIdentifier: .vitalSignRecord) // Ready
    }
    dict["DateOfBirth"]            = HKObjectType.characteristicType(forIdentifier: .dateOfBirth) // Ready
    dict["BiologicalSex"]          = HKObjectType.characteristicType(forIdentifier: .biologicalSex) // Ready
    dict["Weight"]                 = HKObjectType.quantityType(forIdentifier: .bodyMass)
    dict["Height"]                 = HKObjectType.quantityType(forIdentifier: .height)
    dict["BodyFatPercentage"]      = HKObjectType.quantityType(forIdentifier: .bodyFatPercentage)
    dict["BodyMassIndex"]          = HKObjectType.quantityType(forIdentifier: .bodyMassIndex)
    dict["LeanBodyMass"]           = HKObjectType.quantityType(forIdentifier: .leanBodyMass)
    dict["HeartRate"]              = HKObjectType.quantityType(forIdentifier: .heartRate) // Ready
    dict["InhalerUsage"]           = HKObjectType.quantityType(forIdentifier: .inhalerUsage)
    dict["BodyTemperature"]        = HKObjectType.quantityType(forIdentifier: .bodyTemperature)
    dict["BloodPressureSystolic"]  = HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic)
    dict["BloodPressureDiastolic"] = HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)
    dict["RespiratoryRate"]        = HKObjectType.quantityType(forIdentifier: .respiratoryRate)
    dict["BloodGlucose"]           = HKObjectType.quantityType(forIdentifier: .bloodGlucose)
    dict["SleepAnalysis"]          = HKObjectType.categoryType(forIdentifier: .sleepAnalysis)
    
    return dict
  }
  
  @objc(authorizationStatus:)
  func authorizationStatus(callback: RCTResponseSenderBlock) {
    var result = [String: String]()
    if #available(iOS 12.0, *) {
      for (recordName, recordType) in getTypes() {
        let status = store.authorizationStatus(for: recordType)
        var statusName = ""
        switch status {
        case HKAuthorizationStatus.notDetermined:
          statusName = "notDetermined"
        case HKAuthorizationStatus.sharingDenied:
          statusName = "sharingDenied"
        case HKAuthorizationStatus.sharingAuthorized:
          statusName = "sharingAuthorized"
        @unknown default:
          statusName = "sharingAuthorized"
        }
        result[recordName] = statusName
      }
      callback([null, result])
    } else {
      callback([ERR_UNAVAILABE, null])
    }
  }
  
  @objc(queryRecords:limit:callback:)
  func queryRecords(type: String, limit: Int, callback: @escaping RCTResponseSenderBlock) {
    var lm = HKObjectQueryNoLimit
    if getTypes()[type] == nil {
      callback([ERR_WRONG_TYPE, null])
      return
    }
    if type == "DateOfBirth" {
      getDateOfBirth(callback: callback)
      return
    } else if type == "BiologicalSex" {
      getBiologicalSex(callback: callback)
      return
    }
    guard let HKType = getTypes()[type] as? HKSampleType else {
      callback([ERR_WRONG_TYPE, null])
      return
    }
    func resultsHandler(query: HKSampleQuery, results: [HKSample]?, error: Error?) -> Void {
      if let error = error {
        callback([error.localizedDescription, null])
        return
      }
      var nodes = [[String: Any?]]()
      if let results = results {
        for sample in results {
          switch type {
          case "HeartRate":
            nodes.append(sampleToNodeHeartRate(sample: sample))
          case "Weight":
            nodes.append(sampleToNodeWeight(sample: sample))
          case "Height":
            nodes.append(sampleToNodeHeight(sample: sample))
          case "InhalerUsage":
            nodes.append(sampleToNodeInhalerUsage(sample: sample))
          default:
            nodes.append(sampleToNodeFhir(sample: sample))
          }
        }
      }
      callback([null, nodes])
    }
    
    if limit > 0 {
      lm = limit
    }
    
    let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
    let query = HKSampleQuery(
      sampleType: HKType,
      predicate: nil,
      limit: lm,
      sortDescriptors: [sort],
      resultsHandler: resultsHandler
    )
    store.execute(query)
  }
}
