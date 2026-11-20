export const VEHICLE_TYPE_LABEL: Record<string, string> = {
  CAR: "Carro",
  MOTORCYCLE: "Moto",
  TRUCK: "Caminhão",
  BUS: "Ônibus",
};

export function getVehicleTypeLabel(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return VEHICLE_TYPE_LABEL[value] ?? value;
}
