import { Typography, Button, Box } from "@mui/material";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Awaited } from "@/domain/types";

type Providers = Awaited<ReturnType<typeof getProviders>>;

const useProviders = () => {
  const [state, setState] = useState({
    status: "loading",
    data: undefined as Providers | undefined,
  });
  useEffect(() => {
    const run = async () => {
      const providers = await getProviders();
      setState({ status: "loaded", data: providers });
    };
    run();
  }, []);
  return state;
};

function LoginMenu() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: providers, status: providersStatus } = useProviders();
  if (sessionStatus === "loading" || providersStatus === "loading") {
    return null;
  }
  if (!providers || !Object.keys(providers).length) {
    return null;
  }
  return (
    <Box sx={{ alignItems: "center", display: "flex" }}>
      {session ? (
        <>
          <Typography variant="body2">
            Signed in as <Link href="/profile">{session.user?.name}</Link>{" "}
            {" - "}
          </Typography>
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={async () => await signOut()}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body2">
            Not signed in
            {" - "}
          </Typography>
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => signIn("keycloak")}
          >
            Sign in
          </Button>
        </>
      )}
    </Box>
  );
}

export default LoginMenu;