/// <reference types="vite/client" />

declare global {
    interface ImportMetaEnv {
        readonly VITE_AMM_FACTORY_PROCESS: string;
        readonly VITE_TOKEN_LOCKER_PROCESS: string;
        readonly VITE_DEXI_TOKEN_PROCESS: string;
        readonly VITE_DEXI_AMM_MONITOR: string;
        readonly VITE_REGISTRY_PROCESS: string;
        readonly VITE_WRAPPED_AR_PROCESS: string;
        readonly VITE_Q_AR_PROCESS: string;
    }
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}