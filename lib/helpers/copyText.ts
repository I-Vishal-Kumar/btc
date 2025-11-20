import { enqueueSnackbar } from "notistack";
// @ts-expect-error types not availabe for these
import { isNativeApp } from "webtonative";
// @ts-expect-error types not availabe for these
import { set } from "webtonative/Clipboard";

export async function copyToClipboard(text: string) {
  try {

    const formattedText = text?.toString().trim();
    if (!formattedText) return enqueueSnackbar("Failed to copy.", {variant: 'error'})

    if (isNativeApp) {

      set({ data: formattedText });

    } else {
      await navigator.clipboard.writeText(formattedText);
      const copiedText = await navigator.clipboard.readText();

      if(copiedText === formattedText){
        enqueueSnackbar("Copied text", {variant: "success"})
      }else enqueueSnackbar("Failed to copy.", {variant: 'error'});
      
    }
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    return false;
  }
}
