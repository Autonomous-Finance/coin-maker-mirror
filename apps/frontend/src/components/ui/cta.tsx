import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

export default function CTA() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Just another CTA</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt,
          voluptatibus hic?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="sm" className="w-full">
          Yes
        </Button>
      </CardContent>
    </Card>
  );
}
