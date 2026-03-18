import api from '../api/client';
import type { Location } from './useLocations';
import { fetchLocationByTypeAndId, locationQueryKey } from './useLocations';

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockLocation: Location = {
  districtid: 1,
  districtname: 'Patna',
  district_code: 'PAT',
};

describe('useLocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports location query key', () => {
    expect(locationQueryKey('districts', 1)).toEqual([
      'location',
      'districts',
      1,
    ]);
  });

  it('fetchLocationByTypeAndId calls GET /locations/:type/:id', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockLocation });

    const result = await fetchLocationByTypeAndId('districts', 1);

    expect(api.get).toHaveBeenCalledWith('/locations/districts/1');
    expect(result).toEqual(mockLocation);
  });
});
