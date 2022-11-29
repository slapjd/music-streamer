export interface IObservable {
    subscribe(callback: VoidFunction): void
    unsubscribe(callback: VoidFunction): void
    notify(): void
}