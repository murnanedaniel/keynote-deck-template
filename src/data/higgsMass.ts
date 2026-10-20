// Example data for the template; re-check every value against the paper before reusing it.
export const HIGGS_MASS = [
  {
    label: "ATLAS + CMS, Run 1",
    experiment: "ATLAS + CMS",
    value: 125.09,
    err: 0.24,
    year: 2015,
    source: "Phys. Rev. Lett. 114 (2015) 191803",
    href: "https://doi.org/10.1103/PhysRevLett.114.191803",
  },
  {
    label: "CMS, Run 1 + 2016",
    experiment: "CMS",
    value: 125.38,
    err: 0.14,
    year: 2020,
    source: "Phys. Lett. B 805 (2020) 135425",
    href: "https://doi.org/10.1016/j.physletb.2020.135425",
  },
  {
    label: "ATLAS, Run 1 + Run 2",
    experiment: "ATLAS",
    value: 125.11,
    err: 0.11,
    year: 2023,
    source: "Phys. Rev. Lett. 131 (2023) 251802",
    href: "https://doi.org/10.1103/PhysRevLett.131.251802",
  },
] as const;
