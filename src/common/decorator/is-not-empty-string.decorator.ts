// is-not-empty-string.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNotEmptyString(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [min, max] = args.constraints;
          if (typeof value !== 'string') return false;

          const trimmed = value.trim();
          if (!trimmed) return false;

          return trimmed.length >= min && trimmed.length <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [min, max] = args.constraints;
          return `${args.property}는 공백이 아닌 문자열이어야 하며 ${min}자 이상 ${max}자 이하이어야 합니다.`;
        },
      },
    });
  };
}