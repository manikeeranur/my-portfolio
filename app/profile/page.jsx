import PrivateRoute from "@/components/Auth/PrivateRoute";
import Profile from "@/components/Profile/Profile";

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  );
}
