import React from 'react';
import { MapPin, Users, Phone, Building } from 'lucide-react';
import { VillageDistrict, NeighborhoodUnit, Resident, FamilyCard } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';

interface WilayahViewProps {
  districts: VillageDistrict[];
  neighborhoods: NeighborhoodUnit[];
  residents: Resident[];
  familyCards: FamilyCard[];
  onNavigate: (page: string) => void;
}

export const WilayahView: React.FC<WilayahViewProps> = ({
  districts,
  neighborhoods,
  residents,
  familyCards,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Administrasi Kependudukan' }, { label: 'Wilayah (Dusun, RW & RT)' }]}
        onNavigate={onNavigate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {districts.map(d => {
          const countResidents = residents.filter(r => r.districtName.toLowerCase().includes(d.name.toLowerCase())).length;
          const countKK = familyCards.filter(fc => fc.districtName.toLowerCase().includes(d.name.toLowerCase())).length;

          return (
            <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {d.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{d.name}</h4>
                </div>
                <div className="p-2 bg-emerald-100/60 text-emerald-800 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p><b>Kepala Dusun:</b> {d.headName}</p>
                <p><b>Kontak:</b> {d.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                <div className="rounded bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-500 block">Penduduk</span>
                  <span className="font-black text-slate-900">{countResidents || d.populationCount} Jiwa</span>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-500 block">Keluarga</span>
                  <span className="font-black text-slate-900">{countKK || Math.round((d.populationCount || 100) / 3.5)} KK</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rukun Warga & Rukun Tetangga (RW & RT) Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-sm">Daftar Rukun Tetangga (RT) & Rukun Warga (RW)</h4>
          <span className="text-xs text-slate-500">{neighborhoods.length} Unit Lingkungan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700 border-b">
              <tr>
                <th className="py-2.5 px-4">Dusun</th>
                <th className="py-2.5 px-4">RW</th>
                <th className="py-2.5 px-4">RT</th>
                <th className="py-2.5 px-4">Ketua RT / RW</th>
                <th className="py-2.5 px-4">Kontak Telepon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {neighborhoods.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{n.districtName}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">RW {n.rwNumber}</td>
                  <td className="py-2.5 px-4 font-mono">RT {n.rtNumber}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{n.chairpersonName}</td>
                  <td className="py-2.5 px-4 text-slate-500">{n.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
