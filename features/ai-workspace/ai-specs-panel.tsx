import { Download, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * The `Specs` tab: the generate action over the list of specifications.
 *
 * **Both actions and the card are static.** `Generate Spec` calls nothing, the
 * card is one worked example rather than a stored record, and the download is
 * `disabled` — no specification is generated, saved, or written to blob storage
 * in this unit. Following the convention the navbar already uses, an action
 * whose behaviour is not implemented is rendered visibly not ready rather than
 * wired to a no-op.
 *
 * The card sits on the elevated `--popover` surface because the panel around it
 * is already `--card`; the primitive's own ring alone would leave it reading as
 * part of the panel.
 */
export function AiSpecsPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Button className="w-full shrink-0" disabled>
        <Sparkles data-icon="inline-start" />
        Generate Spec
      </Button>

      <ScrollArea className="min-h-0 flex-1">
        <ul className="pr-2">
          <li>
            <Card size="sm" className="bg-popover">
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <FileText
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  Solution Architecture Specification
                </CardTitle>
                <CardDescription>
                  An example of the generated design: the WorkHQ and Design
                  Studio components of an automation solution, how they are
                  connected, and the assumptions behind the split.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                  aria-label="Download Solution Architecture Specification"
                >
                  <Download data-icon="inline-start" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </li>
        </ul>
      </ScrollArea>
    </div>
  );
}
