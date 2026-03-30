/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK: 'utopia' | 'stillness' | 'devnet';
  readonly VITE_TRADE_HUB_PACKAGE_ID_UTOPIA: string;
  readonly VITE_TRADE_HUB_PACKAGE_ID_STILLNESS: string;
  readonly VITE_TRADE_HUB_PACKAGE_ID_DEVNET: string;
  readonly VITE_TRADE_HUB_OBJECT_ID_UTOPIA: string;
  readonly VITE_TRADE_HUB_OBJECT_ID_STILLNESS: string;
  readonly VITE_TRADE_HUB_OBJECT_ID_DEVNET: string;
  readonly VITE_SUI_RPC_UTOPIA: string;
  readonly VITE_SUI_RPC_STILLNESS: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}