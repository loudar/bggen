![img.png](img.png)

# What is this?

BGGEN is an image generator. It randomizes various settings and generates an image based on those settings.
The parameters can't be specifically set, but you can change the min and max values of the parameters to get a different image.
By default, the full range of the parameters is used.

## Example

If you want to generate, say, a blue image, you can set the hue range in the `colors` section from 50 to 70 and the hue variation range in the `variation` section from 0 to 20.


# How to run

```bash
npm install
```

```bash
npm start
```

# How to use

- The right panel gives you the options to change the settings of the generator.
- The left panel shows the generated image.
- You can enable/disable certain shapes by setting the min and max values of the corresponding sliders.
- You can click images within the history to jump back in time.

## Shortcuts
- `g` generate a new image
- `s` download the current image
- `k` keep the current items
- `c` keep the current colors
- `a` toggle animation
- `<-` load the previous image from history
- `->` load the next image in from history