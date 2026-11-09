
import DashboardLayout, {
  DashboardUser,
  DashboardSection,
} from "./DashboardLayout";

type Props = {
  user: DashboardUser;
  onLogout: () => void | Promise<void>;
};

const sections: DashboardSection[] = [
  {
    title: "My Invigilation Duties",
    description: "View assigned examinations and times.",
  },
  {
    title: "Assigned Examination Rooms",
    description: "Check rooms allocated for your duties.",
  },
  {
    title: "Attendance Management",
    description: "Record student attendance for assigned exams.",
  },
];

export default function FacultyDashboard({
  user,
  onLogout,
}: Props) {
  return (
    <DashboardLayout
      user={user}
      title="Faculty Dashboard"
      subtitle="Your examination responsibilities"
      sections={sections}
      onLogout={onLogout}
    />
  );
}
