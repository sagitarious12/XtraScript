export enum StateNamespace {
    BOOK = 'Book',
    BOOKS = 'Books',
    BOOK_COUNT = 'Book Count',
    CHAPTER = 'Chapter',
    USERS = 'Users',
    SEARCH = 'Library Search',
    SCREEN = 'Screens',
    BOOKMARK = 'Bookmark',
    NOTES = 'Notes'
}

export interface AppState {
    [key: string]: any;
}

export interface StateManager<Payload, Data> {
    dispatch: (payload: Payload | void) => void;
    data$: Observable<Data>;
    isLoading$: Observable<boolean>;
    onSuccess$: Observable<void>;
    select: <T>(filterFn?: (value: T, index: number) => boolean) => T | T[];
}
  
export class StoreManager {
  
    appState: AppState = {};
  
    constructor() {}
  
    createStateManager = <Payload = void, Data = void>(
      namespace: StateNamespace, 
      sideEffect: (payload: Payload) => Observable<Data>, 
      initialValue: any = null
    ): StateManager<Payload, Data> => {
      const isLoading$ = new BehaviorSubject(false);
      const data$ = new BehaviorSubject(initialValue);
      const onSuccess$ = new Subject<void>();
      const manager = <StateManager<Payload, Data>>{
        dispatch: (payload: Payload) => {
          isLoading$.next(true);
          sideEffect(payload).pipe(first()).subscribe((res: Data) => {
            this.appState[namespace] = res;
            data$.next(res);
            onSuccess$.next();
            isLoading$.next(false);
          }, (error: any) => {
            data$.next(initialValue);
            isLoading$.next(false);
          });
        },
        data$: data$.asObservable(),
        isLoading$: isLoading$.asObservable(),
        onSuccess$: onSuccess$.asObservable(),
        select: <Data>(filterFn: (value: Data, index: number) => boolean) => {
          const results = this.appState[namespace];
          if (Array.isArray(results)) {
            return results.filter(filterFn);
          } else return results;
        }
      }
      return manager;
    }
}