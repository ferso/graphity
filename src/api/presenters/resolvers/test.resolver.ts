import {
  Query,
  Resolver,
  Mutation,
  Arg,
  Args,
  Subscription,
  Int,
  Root,
  PubSub,
} from "type-graphql";
import { PubSubEngine } from "graphql-subscriptions";
let currentNumber = 1;

@Resolver()
export class TestResolver {
  @Query((returns) => Boolean, { nullable: true })
  async test(@PubSub() pubSub: PubSubEngine): Promise<Boolean> {
    await pubSub.publish("NUMBER_INCREMENTED", {
      numberIncremented: currentNumber++,
    });
    await pubSub.publish("NOTIFICATIONS", {
      text: `Test exeution ${currentNumber}`,
    });
    return true;
  }
  @Subscription((returns) => Int, {
    topics: "NUMBER_INCREMENTED",
    nullable: true,
  })
  numberIncremented(@Root() { numberIncremented }: any): Number {
    return numberIncremented;
  }

  @Subscription((returns) => String, {
    topics: "NOTIFICATIONS",
    nullable: true,
  })
  notification(@Root() { text }: any): string {
    console.log(text);
    return text;
  }
}
export default TestResolver;
