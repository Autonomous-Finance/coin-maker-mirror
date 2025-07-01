import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import global styles
import "./main.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the generated route tree
import { ArweaveWalletKit } from "arweave-wallet-kit";
import DevTools from "./components/devtools";
import Footer from "./components/footer";
import TopBar from "./components/top-bar";
import { Toaster } from "./components/ui/sonner";
import { default as CreateTokenRoot } from "./pages/create-token";
import CreateTokenDeploy from "./pages/create-token/deploy";
import CreateTokenDistribution from "./pages/create-token/distribution";
import CreateTokenIndex from "./pages/create-token/index";
import CreateTokenSocialMedia from "./pages/create-token/social-media";
import DashboardPage from "./pages/dashboard";
import IndexPage from "./pages/index";
import TokenRoot from "./pages/token";
import CreateLiquidityPoolPage from "./pages/token/create-liquidity-pool";
import TokenPage from "./pages/token/index";
import LiquidityPoolPage from "./pages/token/liquidity-pool";
import TokensPage from "./pages/tokens";
import Authenticated from "./providers/authenticated";
import { ThemeProvider } from "./providers/theme-provider";
import EnhanceTokenMetadata from "./pages/token/update-metadata";
import BondingCurveRoot from "./pages/bonding-curve";

const rootRoute = createRootRoute({
  component: () => (
    <div className="w-full min-h-screen pb-24">
      <div className="container dark:bg-slate-950 relative z-30">
        <TopBar />
      </div>
      <Outlet />
      <Footer />
      <Toaster />
      <DevTools />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <Authenticated>
      <DashboardPage />
    </Authenticated>
  ),
});

// Create Token Routes
const createTokenRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-token",
  component: () => <CreateTokenRoot />,
});

const createTokenSettingsRoute = createRoute({
  getParentRoute: () => createTokenRootRoute,
  path: "/",
  component: CreateTokenIndex,
});

const createTokenSocialMediaRoute = createRoute({
  getParentRoute: () => createTokenRootRoute,
  path: "/social-media",
  component: CreateTokenSocialMedia,
});

const createTokenDistributionRoute = createRoute({
  getParentRoute: () => createTokenRootRoute,
  path: "/distribution",
  component: CreateTokenDistribution,
});

const createTokenDeployRoute = createRoute({
  getParentRoute: () => createTokenRootRoute,
  path: "/deploy",
  component: CreateTokenDeploy,
});

const createTokenRoutes = createTokenRootRoute.addChildren([
  createTokenSettingsRoute,
  createTokenSocialMediaRoute,
  createTokenDistributionRoute,
  createTokenDeployRoute,
]);


// Bonding curve route
const bondingCurveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bonding-curve",
  component: () => <BondingCurveRoot />,
});

// Tokens route
const tokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tokens",
  component: TokensPage,
});

// Single Token routes
const tokenRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/token/$tokenId",
  component: TokenRoot,
});

const tokenRoute = createRoute({
  getParentRoute: () => tokenRootRoute,
  path: "/",
  component: TokenPage,
});

const tokenCreateLPRoute = createRoute({
  getParentRoute: () => tokenRootRoute,
  path: "/create-liquidity-pool",
  component: CreateLiquidityPoolPage,
});

const tokenLPRoute = createRoute({
  getParentRoute: () => tokenRootRoute,
  path: "/pool/$poolId",
  component: LiquidityPoolPage,
});

const tokenUpdateMetadata = createRoute({
  getParentRoute: () => tokenRootRoute,
  path: "/update-metadata",
  component: EnhanceTokenMetadata,
});

const tokenRoutes = tokenRootRoute.addChildren([
  tokenRoute,
  tokenCreateLPRoute,
  tokenLPRoute,
  tokenUpdateMetadata,
]);

const routeTree = rootRoute.addChildren([
  indexRoute,
  createTokenRoutes,
  tokensRoute,
  bondingCurveRoute,
  dashboardRoute,
  tokenRoutes,
]);

// Enable hash history
const hashHistory = createHashHistory();

// Create a new router instance
const router = createRouter({ routeTree, history: hashHistory });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Check for specific error types to determine if we should retry
        if (error instanceof Error) {
          const err = error as any

          // Explicit check for 429 rate limiting errors
          const is429Error =
            err.status === 429 ||
            err.statusCode === 429 ||
            error.message.includes("429") ||
            error.message.includes("Too Many Requests")

          if (is429Error) {
            console.log(`Retrying query after 429 rate limit error (attempt ${failureCount})`)
            // Be more persistent with rate limit retries
            return failureCount < 10 // Try up to 10 times for 429s
          }

          // Check for other network failures
          const isNetworkError =
            error.message.includes("Failed to fetch") ||
            error.message.includes("Network request failed") ||
            err.status === 503 ||
            err.statusCode === 503

          if (isNetworkError) {
            console.log(`Retrying query after network error (attempt ${failureCount})`)
            return failureCount < 8 // Try up to 8 times for network issues
          }
        }

        // Default React Query retry logic for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => {
        // Even faster for 429 errors, as they're expected to clear quickly
        const baseDelay = 300 // Start at 300ms
        const delay = Math.min(baseDelay * 1.3 ** attemptIndex, 3000) // Max 3 seconds

        // Small jitter to prevent all clients retrying simultaneously
        const jitter = delay * 0.1 * Math.random()

        console.log(
          `Global retry delay: ${Math.round(delay + jitter)}ms (attempt ${attemptIndex + 1})`,
        )
        return delay + jitter
      },
    },
  },
})

// Render the app
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ArweaveWalletKit
          config={{
            permissions: ["SIGN_TRANSACTION", "ACCESS_ADDRESS"],
            ensurePermissions: true,
          }}
          theme={{
            displayTheme: "light",
            radius: "minimal",
          }}
        >
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ArweaveWalletKit>
      </ThemeProvider>
    </StrictMode>
  );
}
