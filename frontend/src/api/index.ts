// frontend/src/api/index.ts
export const API_BASE = "http://127.0.0.1:8000/api";

// それぞれのモジュールをまとめて export
export * from "./authApi";
export * from "./coordination_items";
export * from "./coordinations";
export * from "./items";
export * from "./storages";
export * from "./subcategories";
export * from "./usage_history";
export * from "./users";
export * from "./declutter";
export * from "./imageAnalysis";
