import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({ options: { allowMixed: 0 } }) // Important for proper metadata generation
export class FeeCollectedEvent {
  
  @prop({required: true, unique: true})
  public transactionHash!: string;

  @prop({ required: true })
  public blockNumber!: number;

  @prop({ required: true })
  public token!: string;

  @prop({ required: true, index: true })
  public integrator!: string;

  @prop({ required: true })
  public integratorFee!: string; // Store BigNumber as string

  @prop({ required: true })
  public lifiFee!: string; // Store BigNumber as string
}

export const FeeCollectedEventModel = getModelForClass(FeeCollectedEvent);
