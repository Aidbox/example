//
//  RNAppleHealth-fhir.swift
//  az
//
//  Created by Mikhail Poluboyarinov on 07/03/2019.
//  Copyright © 2019 Health Samurai. All rights reserved.
//

import Foundation
import HealthKit

extension RNAppleHealth {
  func sampleToNodeFhir(sample: HKSample) -> [String: Any?] {
    var node = [String: Any?]()
    if #available(iOS 12.0, *) {
      if
        let record = sample as? HKClinicalRecord,
        let fhir = record.fhirResource,
        let resource = try? JSONSerialization.jsonObject(with: fhir.data)
      {
        node["sourceId"] = record.source.bundleIdentifier
        node["sourceName"] = record.source.name
        node["identifier"] = fhir.identifier
        node["displayName"] = record.displayName
        node["resource"] = resource
        node["resourceType"] = fhir.resourceType.rawValue
        node["url"] = fhir.sourceURL?.absoluteString
      }
    }
    return node
  }
}

