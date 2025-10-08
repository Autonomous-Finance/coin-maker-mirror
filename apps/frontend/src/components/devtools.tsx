import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export default function DevTools() {
  return (
    <>
      {process.env.NODE_ENV === "development" ? (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools initialIsOpen={true} />
        </>
      ) : null}
    </>
  );
}
