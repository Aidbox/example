//
//  RNAppleHealth-vitals.swift
//  az
//
//  Created by Mikhail Poluboyarinov on 07/03/2019.
//  Copyright © 2019 Health Samurai. All rights reserved.
//

import Foundation
import HealthKit

extension RNAppleHealth {
  // Height
  func sampleToNodeHeight(sample: HKSample) -> [String: Any?] {
    var node = [String: Any?]()
    if let record = sample as? HKQuantitySample {
      node["startDate"] = record.startDate.description
      node["endDate"] = record.endDate.description
      let quantity: HKQuantity = record.quantity
      let unit = HKUnit(from: LengthFormatter.Unit.centimeter)
      let value = quantity.doubleValue(for: unit)
      node["value"] = value
      node["unit"] = unit.description
    }
    return node
  }
  // Weight
  func sampleToNodeWeight(sample: HKSample) -> [String: Any?] {
    var node = [String: Any?]()
    if let record = sample as? HKQuantitySample {
      node["startDate"] = record.startDate.description
      node["endDate"] = record.endDate.description
      let quantity: HKQuantity = record.quantity
      let unit = HKUnit(from: MassFormatter.Unit.kilogram)
      let value = quantity.doubleValue(for: unit)
      node["value"] = value
      node["unit"] = unit.description
    }
    return node
  }
  // Heart Rate
  func sampleToNodeHeartRate(sample: HKSample) -> [String: Any?] {
    var node = [String: Any?]()
    if let record = sample as? HKQuantitySample {
      node["startDate"] = record.startDate.description
      node["endDate"] = record.endDate.description
      node["context"] = "0"
      let quantity: HKQuantity = record.quantity
      let unit = HKUnit(from: "count/min")
      let value = quantity.doubleValue(for: unit)
      node["value"] = value
      node["unit"] = "beats/minute"
    }
    return node
  }
  
  // Inhaler Usage
  func sampleToNodeInhalerUsage(sample: HKSample) -> [String: Any?] {
    var node = [String: Any?]()
    if let record = sample as? HKQuantitySample {
      node["startDate"] = record.startDate.description
      node["endDate"] = record.endDate.description
      let quantity: HKQuantity = record.quantity
      let unit = HKUnit(from: "count")
      let value = quantity.doubleValue(for: unit)
      node["value"] = value
      node["unit"] = "count"
    }
    return node
  }
}
