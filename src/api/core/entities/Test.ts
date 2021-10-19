import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType({ description: "The Test model" })
export class Test {
  @Field(() => ID)
  id: String;

  @Field()
  name: String;
}
