// Ubicaciones con exhibidor Nuvitt y sus galerías (extraído del sitio original).

export type Location = { name: string; cover: string; photos: string[] };
export type City = { name: string; accent: string; locations: Location[] };

export const cities: City[] = [
  {
    name: "Maracaibo",
    accent: "#007ec5",
    locations: [
      {
        name: "Delicias con 73",
        cover: "DSC_8017.webp",
        photos: ["DSC_8028.webp", "DSC_8031.webp", "DSC_8037.webp", "DSC_8038.webp", "DSC_8049.webp", "DSC_8054.webp", "DSC_8063.webp", "DSC_8017.webp"],
      },
      {
        name: "Bella Vista",
        cover: "DSC_7969.webp",
        photos: ["DSC_7970.webp", "DSC_7987.webp", "DSC_7976.webp", "DSC_7982.webp", "DSC_7973.webp", "DSC_7969.webp"],
      },
      {
        name: "Dr. Portillo",
        cover: "DSC_8082.webp",
        photos: ["DSC_8086.webp", "DSC_8095.webp", "DSC_8105.webp", "DSC_8082.webp"],
      },
      {
        name: "Fuerzas Armadas",
        cover: "DSC_7995.webp",
        photos: ["DSC_8004.webp", "DSC_8006.webp", "DSC_8016.webp", "DSC_7995.webp"],
      },
    ],
  },
  {
    name: "Caracas",
    accent: "#e1521b",
    locations: [
      {
        name: "Andrés Bello",
        cover: "FRA06909.webp",
        photos: ["FRA06909.webp", "FRA06910.webp", "FRA06911.webp", "FRA06912.webp", "FRA06913.webp", "FRA06914.webp", "FRA06915.webp", "FRA06916.webp", "FRA06917.webp", "FRA06918.webp", "FRA06919.webp", "FRA06906.webp"],
      },
      {
        name: "La Trinidad",
        cover: "FRA06920.webp",
        photos: ["FRA06921.webp", "FRA06922.webp", "FRA06923.webp", "FRA06924.webp", "FRA06925.webp", "FRA06926.webp", "FRA06928.webp", "FRA06929.webp", "FRA06931.webp", "FRA06932.webp", "FRA06933.webp", "FRA06920.webp"],
      },
      {
        name: "Centro Médico Docente La Trinidad",
        cover: "FRA06935.webp",
        photos: ["FRA06936.webp", "FRA06937.webp", "FRA06939.webp", "FRA06940.webp", "FRA06941.webp", "FRA06942.webp", "FRA06943.webp", "FRA06944.webp", "FRA06945.webp", "FRA06935.webp"],
      },
      {
        name: "Las Mercedes",
        cover: "FRA06946.webp",
        photos: ["FRA06947.webp", "FRA06948.webp", "FRA06950.webp", "FRA06951.webp", "FRA06952.webp", "FRA06953.webp", "FRA06955.webp", "FRA06956.webp", "FRA06957.webp", "FRA06959.webp", "FRA06962.webp", "FRA06963.webp", "FRA06964.webp", "FRA06965.webp", "FRA06946.webp"],
      },
      {
        name: "Los Dos Caminos",
        cover: "FRA06967.webp",
        photos: ["FRA06968.webp", "FRA06969.webp", "FRA06970.webp", "FRA06971.webp", "FRA06973.webp", "FRA06974.webp", "FRA06975.webp", "FRA06976.webp", "FRA06977.webp", "FRA06978.webp", "FRA06967.webp"],
      },
    ],
  },
];
