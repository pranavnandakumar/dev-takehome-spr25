// src/models/Request.ts
import {
    Schema,
    model,
    models,
    type Model,
    type InferSchemaType,
  } from "mongoose";
  
  const RequestSchema = new Schema(
    {
      requestorName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
        trim: true,
      },
      itemRequested: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true,
      },
      createdDate: {
        type: Date,
        required: true,
        default: () => new Date(),
        index: true,
      },
      lastEditedDate: {
        type: Date, // optional
      },
      status: {
        type: String,
        enum: ["pending", "completed", "approved", "rejected"],
        required: true,
        default: "pending",
        index: true,
      },
    },
    { versionKey: false }
  );
  
  // infer the TS type from the schema
  export type RequestDoc = InferSchemaType<typeof RequestSchema>;
  
  // IMPORTANT: give the model a concrete type to avoid TS2590
  const RequestModel: Model<RequestDoc> =
    (models.Request as Model<RequestDoc>) || model<RequestDoc>("Request", RequestSchema);
  
  export default RequestModel;
  