import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const user = useSelector((state) => state.user);

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Login to view your profile.
        </p>
        <Button className="mt-6" render={<Link to="/login" />}>
          Login
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Profile
      </h1>
      <div className="mt-8 space-y-3 rounded-xl border border-border p-5">
        <div>
          <p className="text-xs text-muted-foreground">Name</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
      </div>
      <Button className="mt-6" variant="outline" render={<Link to="/dashboard" />}>
        Go to dashboard
      </Button>
    </main>
  );
};

export default Profile;
