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

export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "SP";
  return (
    source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SP"
  );
}

export function getRoleLabel(role?: string | null): string {
  return role === "ADMIN" ? "Administrador" : "Motorista";
}
