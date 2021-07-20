import PBPartialData from "../structures/PBPartialData.js";
import { safeFormat } from "./Functions.js";

type PBDataProps = "id" | "first_name" | "last_name" | "phone_numbers";

export function expect(data: any, expected: PBDataProps[]): void {
  const this_data = data as PBPartialData;
  const errors = [] as string[];

  if (expected.includes("id")) {
    if (
      !this_data ||
      typeof this_data.id !== "string" ||
      this_data.id.length !== 24
    ) {
      errors.push("Invalid ID");
    }
  }

  if (expected.includes("first_name")) {
    if (
      !this_data ||
      typeof this_data.first_name !== "string" ||
      safeFormat(this_data.first_name).length === 0
    ) {
      errors.push("Invalid First Name");
    }
  }

  if (expected.includes("last_name")) {
    if (
      !this_data ||
      typeof this_data.last_name !== "string" ||
      safeFormat(this_data.last_name).length === 0
    ) {
      errors.push("Invalid Last Name");
    }
  }

  if (expected.includes("phone_numbers")) {
    if (
      !this_data ||
      !Array.isArray(this_data.phone_numbers) ||
      this_data.phone_numbers.some(
        (pnum) => typeof pnum !== "string" || safeFormat(pnum).length === 0
      )
    ) {
      errors.push("Invalid Phone Numbers");
    }
  }

  if (errors.length) throw errors.join("\n");
}

export function expectAll(data: any): void {
  expect(data, ["id", "first_name", "last_name", "phone_numbers"]);
}
