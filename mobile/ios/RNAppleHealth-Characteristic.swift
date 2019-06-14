//
//  RNAppleHealth-Characteristic.swift
//  az
//
//  Created by Mikhail Poluboyarinov on 07/03/2019.
//  Copyright © 2019 Health Samurai. All rights reserved.
//

import Foundation
import HealthKit

extension RNAppleHealth {
  func getDateOfBirth(callback: @escaping RCTResponseSenderBlock) {
    do {
      let date = try store.dateOfBirth()
      var node = [String: Any?]()
      if date.description == "" {
        node["value"] = null
        node["age"] = null
      } else {
        let now = Date()
        let years: Set<Calendar.Component> = [.year]
        let age = NSCalendar.current.dateComponents(years, from: date, to: now)
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        node["value"] = df.string(from: date)
        node["age"] = age.year
      }
      callback([null, node])
    } catch {
      callback([error.localizedDescription, null])
    }
  }
  
  func getBiologicalSex(callback: RCTResponseSenderBlock) {
    do {
      let sex = try store.biologicalSex()
      var node = [String: Any?]()
      var value: String;
      switch sex.biologicalSex {
      case HKBiologicalSex.female:
        value = "female"
      case HKBiologicalSex.male:
        value = "male"
      case HKBiologicalSex.other:
        value = "other"
      default:
        value = "unknow";
      }
      node["value"] = value
      callback([null, node])
    } catch {
      callback([error.localizedDescription, null])
    }
  }
}
