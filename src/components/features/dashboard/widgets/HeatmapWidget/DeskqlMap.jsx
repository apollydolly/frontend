import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { BitmapLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "deck.gl";
import { COORDINATE_SYSTEM, OrthographicView } from "@deck.gl/core";

export default function DeskqlMap({
  image,
  imageSize,
  heatmapData,
  viewState,
}) {
  const view = useMemo(
    () =>
      new OrthographicView({
        id: "room",
        flipY: true,
        controller: false,
      }),
    [],
  );

  const layers = useMemo(() => {
    const result = [];

    if (image) {
      result.push(
        new BitmapLayer({
          id: "room-scheme",
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [
            [0, imageSize.height],
            [0, 0],
            [imageSize.width, 0],
            [imageSize.width, imageSize.height],
          ],
          image,
        }),
      );
    }

    if (heatmapData?.length) {
      result.push(
        new HeatmapLayer({
          id: "people-heatmap",
          data: heatmapData,
          getPosition: (d) => [d.y, d.x],
          getWeight: (d) => d.count,
          radiusPixels: 50,
        }),
      );
    }

    return result;
  }, [image, imageSize, heatmapData]);

  return (
    <DeckGL
      views={view}
      layers={layers}
      initialViewState={viewState}
      width="100%"
      height="100%"
      controller={false}
    />
  );
}
