//
//  RNAppleHealthBridge.m
//
//  Created by Mikhail Poluboyarinov on 28/02/2019.
//  Copyright © 2019 Health Samurai. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNAppleHealth, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(
  queryRecords:(NSString *)type
  limit:(NSInteger *)limit
  callback:(RCTResponseSenderBlock)callback
)

RCT_EXTERN_METHOD(authorizationStatus:(RCTResponseSenderBlock)callback)

@end
