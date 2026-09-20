declare module 'snowflake-id' {
  interface SnowflakeIdOptions {
    mid?: number;
    offset?: number;
  }

  export default class SnowflakeId {
    constructor(options?: SnowflakeIdOptions);
    generate(): string;
  }
}
