/**
 * Generic result container representing either a successful outcome with data
 * or a failed outcome with an `Error` instance.
 *
 * Pattern:
 * - `ok === true`  -> `data` is populated, `error` is null
 * - `ok === false` -> `data` is null, `error` is populated
 *
 * @template T Type of the successful data payload.
 */
export class Result<T> {
    public readonly ok: boolean;
    public readonly data: T | null;
    public readonly error: Error | null;

    /**
     * @param ok Whether the operation succeeded.
     * @param data The domain data (present only when `ok` is true).
     * @param error Error instance describing the failure (present only when `ok` is false).
     */
    constructor(ok: boolean, data: T | null, error: Error | null) {
        this.ok = ok;
        this.data = data;
        this.error = error;
    }

    /**
     * Create a successful result.
     * @param data Data payload to attach.
     * @returns A `Result` with `ok=true`.
     */
    static success<T>(data: T): Result<T> {
        return new Result<T>(true, data, null);
    }

    /**
     * Create a failed result.
     * @param error Error instance (or subclass) explaining the failure.
     * @returns A `Result` with `ok=false`.
     */
    static error<T>(error: Error): Result<T> {
        return new Result<T>(false, null, error);
    }
}
