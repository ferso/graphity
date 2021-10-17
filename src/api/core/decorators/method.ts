interface IActionController {
  route: string;
  method: string;
}

export const method =
  (options: IActionController) =>
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const actionFunction = descriptor.value;
    const method = options.method;
    const uri = options.route;
    descriptor.value = () => {
      return { actionFunction, method, uri };
    };

    return descriptor;
  };
