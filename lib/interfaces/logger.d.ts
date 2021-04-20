export declare type Logger = (message: string | {
    queryText: string;
    params: unknown[] | undefined;
    duration: number;
}) => void;
