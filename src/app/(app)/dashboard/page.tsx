import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
            <CardDescription>Currently registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">123</p> {/* Placeholder value */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Appointments</CardTitle>
            <CardDescription>Scheduled, completed, or cancelled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">456</p> {/* Placeholder value */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments Today</CardTitle>
            <CardDescription>Scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7</p> {/* Placeholder value */}
          </CardContent>
        </Card>
      </div>
      {/* Further dashboard content can be added here */}
    </div>
  );
}
