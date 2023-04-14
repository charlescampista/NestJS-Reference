import { plainToClass } from "class-transformer";
import { IsEnum, IsNumber, IsString, validateSync } from "class-validator";

enum EnvironmentType {
    Dev = "dev",
    Prod = "prod"
}

class EnvironmentVariables {

    constructor() { }

    @IsEnum(EnvironmentType)
    NODE_ENV: EnvironmentType
    @IsString()
    MONGO_CONNECTION: string;
    @IsString()
    MONGO_DATABASE: string;
    @IsString()
    RMQ_CONNECTION: string;
    @IsString()
    RMQ_QUEUE: string;
    @IsString()
    RMQ_NAME: string;
    @IsString()
    SMTP_HOST: string;
    @IsNumber()
    SMTP_PORT: number;
    @IsString()
    SMTP_USER: string;
    @IsString()
    SMTP_PASSWORD: string;



}

export function validate(configuration: Record<string, unknown>) {
    const finalConfig = plainToClass(
        EnvironmentVariables,
        configuration,
        { enableImplicitConversion: true }
    );

    const errors = validateSync(finalConfig, { skipMissingProperties: true });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return finalConfig;
}