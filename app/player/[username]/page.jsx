import { PublicProfilePage } from "@/components/profile/PublicProfilePage";

export async function generateMetadata({ params }) {
  // Await params if it's a Promise before accessing its properties
  const resolvedParams = await params; 
  const username = resolvedParams.username;

  // Your existing logic for generating metadata
  return {
    title: `Profile of ${username}`,
    description: `View the profile of ${username} on our platform.`,
    // ... other metadata
  };
}

export default async function PlayerPage({ params }) {
  // Await the params object to ensure it's resolved
  const resolvedParams = await params; 

  // Now you can safely access resolvedParams.username
  const { username } = resolvedParams;
  return <PublicProfilePage username={username} />;
}