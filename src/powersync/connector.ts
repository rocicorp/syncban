import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/web";

import { Session, SupabaseClient, createClient } from "@supabase/supabase-js";
import { must } from "~/utils/assert";

export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

export type SupabaseConnectorListener = {
  initialized: () => void;
  sessionStarted: (session: Session) => void;
};

const uploadURL = must(
  import.meta.env.VITE_POWERSYNC_UPLOAD_URL,
  "VITE_POWERSYNC_UPLOAD_URL env var is required"
);

export class Connector
  extends BaseObserver<SupabaseConnectorListener>
  implements PowerSyncBackendConnector
{
  readonly client: SupabaseClient;
  readonly config: SupabaseConfig;

  ready: boolean;

  currentSession: Session | null;

  constructor() {
    super();
    this.config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      powersyncUrl: import.meta.env.VITE_POWERSYNC_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };

    this.client = createClient(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
        },
      }
    );
    this.currentSession = null;
    this.ready = false;
  }

  async init() {
    if (this.ready) {
      return;
    }

    const sessionResponse = await this.client.auth.getSession();
    this.updateSession(sessionResponse.data.session);

    this.ready = true;
    this.iterateListeners((cb) => cb.initialized?.());
  }

  async login() {
    const {
      data: { session },
      error,
    } = await this.client.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    this.updateSession(session);
  }

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    console.debug("session expires at", session.expires_at);

    return {
      endpoint: this.config.powersyncUrl,
      token: session.access_token ?? "",
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      const request = transaction.crud.map((entry) => entry.toJSON());
      await fetch(uploadURL, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.currentSession?.access_token}`,
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("HTTP request failed");
        }
      });

      await transaction.complete();
    } catch (ex) {
      console.error("Data upload error", ex);
      await transaction.complete();
    }
  }

  updateSession(session: Session | null) {
    this.currentSession = session;
    if (!session) {
      return;
    }
    this.iterateListeners((cb) => cb.sessionStarted?.(session));
  }
}
