export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export class SpendCapError extends Error {
  constructor(public spent: number, public cap: number) {
    super(`Daily spend cap reached ($${spent.toFixed(4)} of $${cap.toFixed(2)}). Paid calls are paused until tomorrow or DAILY_CAP_USD is raised.`);
  }
}
