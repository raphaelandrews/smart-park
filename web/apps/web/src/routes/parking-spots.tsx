import { createFileRoute } from "@tanstack/react-router";

import { useListParkingSpaces } from "@/api/generated";

export const Route = createFileRoute("/parking-spots")({
  component: ParkingSpotsComponent,
});

function ParkingSpotsComponent() {
  const { data, isPending, isError, error } = useListParkingSpaces({
    page: 0,
    size: 20,
  });

  if (isPending) {
    return <p className="p-4">Loading parking spots…</p>;
  }

  if (isError) {
    return <p className="p-4 text-red-500">{(error as Error).message}</p>;
  }

  const page = data?.data;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Parking spots</h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Code</th>
            <th className="py-2">Type</th>
            <th className="py-2">Blocked</th>
            <th className="py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {page?.content?.map((space) => (
            <tr key={space.id} className="border-b">
              <td className="py-2">{space.code}</td>
              <td className="py-2">{space.parkingSpaceTypeName}</td>
              <td className="py-2">{space.blocked ? "yes" : "no"}</td>
              <td className="py-2">{space.active ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-sm">
        {page?.totalElements ?? 0} spot(s) loaded from the Spring API.
      </p>
    </div>
  );
}
