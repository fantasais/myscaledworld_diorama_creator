import Debug "mo:core/Debug";
import Common "common";

module {
  public type ConfiguratorStep = {
    #chooseEnvironment;
    #chooseBase;
    #chooseWalls;
    #chooseAccessories;
    #preview;
    #bomReview;
  };

  public type ConfiguratorState = {
    environment : ?Common.Environment;
    baseProductId : ?Common.ProductId;
    wallProductId : ?Common.ProductId;
    accessoryProductIds : [Common.ProductId];
    currentStep : ConfiguratorStep;
  };
};
