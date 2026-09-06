export enum BoxPosition {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
  Center = "center",
}

export interface TutorialStep {
  target: string,
  text: string,
  box: BoxPosition,
  script?: string,
  run_script?: boolean,
}
export const steps: TutorialStep[] = [
  {
    target: "#tutorial-box",
    text: `Hi! Welcome to PixelMatrix. An app made to experiment with logic and use unique output types. The core idea is to run a script multiple times with different inputs to create an output. It's inspired by the game replicube.

    Lets go over the basics to create an output.`,
    box: BoxPosition.Center,
  },
  {
    target: "#tutorial-box",
    text: `The default output is Grid, meaning that the script is run over a grid of pixels and it returns the RGB value of that Pixel. The script has access to the pixels x and y coordinates, aswell as the resolution.

    So a script just returning "[255, 255, 255]" would result in a white grid`,
    box: BoxPosition.Center,
  },
  {
    target: "#in-out-container",
    text: `So lets try that now with this simple script. By default the script uses the Rhai language, a scripting language with syntax similar to JavaScript and Rust.
    It returns "[236, 55, 80]" on every pixel, meaning every pixel is set to that color.`,
    box: BoxPosition.Right,
    script: `//
    // This script always returns the same color
    return [236, 55, 80]`,
  },
  {
    target: "#output-container",
    text: "This is the output. There you can see the result of the script and isn't that a lovely color? But this is a bit boring...",
    box: BoxPosition.Left,
    run_script: true,
  },
  {
    target: "#in-out-container",
    text: `
    So lets add something important. Let us use the pixels coordinates in relation to the output!

    This script runs seperatly for each pixel, so 'x' and 'y' have different values on each pixel. 
    It takes the same color as before but makes it more green along the x-axis and more blue along the y-axis.
    We also multiply this change by 2 to make it more noticeable.
    Also because this is a real programming language we can also use variables and functions to help us.
    `,
    box: BoxPosition.Top,
    script: `
    //
    // 
    let r = 236;
    let g = 55 + ( x * 2 );
    let b = 80 + ( y * 2 );
    return [r, g, b];
    `,
    run_script: true,
  },
  {
    target: "#in-out-container",
    text: `
    We can also use logic to draw something. By using logic statements this script can draw a white h on a background.
    Don't worry if this script is a bit too complex, it is only to showcase how conditions can be used to create something.
    `,
    box: BoxPosition.Top,
    script: `
    //
    let h_color = [255, 255, 255];
    let bgr_color = [236, 55, 88];

    // add a margin to the h
    // using classic logic. '||' means OR and '&&' means AND 
    if y < 5 || y > 27 {
      return bgr_color;
    }

    // left leg of h
    if 3 < x && x < 10 {
      return h_color;
    }

    // right leg of h
    if 22 < x && x < 29 && y > 12 {
      return h_color;
    }

    // middle of h
    // using rhai's in range
    if (x in 10..23) && (y in 13..18) {
      return h_color;
    }

    // fill remaingin pixels with background color
    return bgr_color;`,
    run_script: true,
  },
  {
    target: "#output-toolbar",
    text: "Here are some settings to tweak the output.",
    box: BoxPosition.Left,
  },
  {
    target: "#console",
    text: "If you're ever stuck on something you can use debug and print statements in your script and they will be shown here. For rhai those are 'print()' and 'debug()'.",
    box: BoxPosition.Top,
    script: `
    //
    print("Hackclub!");

    if x > 1 {
      print("Definetly useful message");
    }

    return [236, 55, 88];
    `,
    run_script: true,
  },
  {
    target: "#top-settings",
    text: "Some last things. Here you can switch what language and output to use (More coming soon!).",
    box: BoxPosition.Bottom,
  },

  {
    target: "#help-btn",
    text: "In here you can look up functions and exposed variables for your script, show tool tips and revisit this tutorial.",
    box: BoxPosition.Center,
  },
  {
    target: ".workspace",
    text: "Thats all for now! Now go ahead and write some logic and see how it results into an image. Also check out some patterns you can create with simple logic and try to recreate a logo or picture with this.",
    box: BoxPosition.Center,
  }
]

