import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  status: text("status").notNull(), // PENDING, REVIEW_REQUIRED, APPROVED
  
  // Extracted Data
  date: text("date"),
  shift: text("shift"),
  employeeNumber: text("employee_number"),
  operationCode: text("operation_code"),
  machineNumber: text("machine_number"),
  workOrderNumber: text("work_order_number"),
  quantityProduced: integer("quantity_produced"),
  timeTaken: text("time_taken"),

  // AI Metadata (Storing as JSON strings for simplicity in prototype)
  confidenceScores: text("confidence_scores"),
  validationFailures: text("validation_failures"),
});
