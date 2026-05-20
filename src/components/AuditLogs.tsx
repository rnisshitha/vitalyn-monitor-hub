import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { AuditEntry } from "@/types";

export function AuditLogs({ audits }: { audits: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
      <CardContent>
        {audits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap text-xs">{new Date(a.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{a.userName}</TableCell>
                  <TableCell className="capitalize">{a.role}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell className="text-muted-foreground">{a.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
