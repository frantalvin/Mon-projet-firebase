export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Patient Details: {params.id}</h1>
      <p className="mt-2">Detailed information for patient {params.id} will be displayed here.</p>
      {/* Placeholder for patient details */}
    </div>
  );
}
