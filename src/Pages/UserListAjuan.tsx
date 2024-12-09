import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfil from '../components/Fragments/ProfileUser';
import Placeholder from '../components/Fragments/Placeholder';
import EditAjuanModal from '../components/Fragments/EditAjuanModal';
import { getUserId } from '../utils/auth.utils';

// Menyesuaikan tipe data Ajuan
export interface Ajuan {
  perihal: string;
  status: 'Selesai' | 'Menunggu';
  tanggal: string;
  isiAjuan: string;
}

const UserListAjuan: React.FC = () => {
  const pageTitle = 'List Ajuan';
  const [ajuanList, setAjuanList] = useState<Ajuan[]>([]); // Daftar keluhan
  const [isModalOpen, setIsModalOpen] = useState(false); // Untuk membuka/tutup modal
  const [selectedAjuan, setSelectedAjuan] = useState<Ajuan | null>(null);
  const [loading, setLoading] = useState(true); // State untuk menunjukkan apakah data sedang dimuat
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const id = getUserId();

  useEffect(() => {
    const fetchAjuan = async () => {
      try {
        if (!token) {
          console.error('Token tidak ditemukan');
          navigate('/login');
          return;
        }

        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/complaint/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.data) {
          const ajuanData = response.data.data.map((ajuan: any) => ({
            perihal: ajuan.title,
            status: ajuan.status,
            tanggal: ajuan.createdAt.split('T')[0],
            isiAjuan: ajuan.description,
          }));
          setAjuanList(ajuanData);
        } else {
          setAjuanList([]); // Set ajuanList kosong jika tidak ada data
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setAjuanList([]); // Set ajuanList kosong jika terjadi error
        alert('Gagal mengambil data. Silakan coba lagi.');
      } finally {
        setLoading(false); // Setelah data selesai diambil, ubah state loading menjadi false
      }
    };

    fetchAjuan();
  }, [token, id]);

  const handleAddAjuan = () => {
    // Navigasi ke halaman user-ajuan untuk menambahkan ajuan
    navigate('/user-ajuan');
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Menutup modal edit
    setSelectedAjuan(null); // Reset data ajuan yang sedang diedit
  };

  const handleSaveAjuan = (updatedAjuan: Ajuan) => {
    // Update data ajuan
    const updatedAjuanList = ajuanList.map((ajuan) =>
      ajuan.id === updatedAjuan.id ? updatedAjuan : ajuan
    );
    setAjuanList(updatedAjuanList);
  };

  return (
    <div className='p-8 flex-grow'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>{pageTitle}</h1>
        <UserProfil />
      </div>

      <div>
        {loading ? (
          // Menampilkan pesan loading jika data sedang dimuat
          <div className='text-center py-4 text-xl text-gray-500'>
            Loading data...
          </div>
        ) : ajuanList.length === 0 ? (
          <Placeholder
            title='Belum ada ajuan'
            description='Silakan tambahkan ajuan baru.'
            buttonText='Tambah Ajuan'
            onAdd={handleAddAjuan}
          />
        ) : (
          <table className='w-full border-collapse border'>
            <thead>
              <tr className='bg-primary-dark text-white'>
                <th className='px-4 py-2'>Tanggal</th>
                <th className='px-4 py-2'>Perihal</th>
                <th className='px-4 py-2'>Isi Ajuan</th>
                <th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody>
              {ajuanList.map((ajuan) => (
                <tr key={ajuan.id} className='text-center'>
                  <td className='px-4 py-2 border'>{ajuan.tanggal}</td>
                  <td className='px-4 py-2 border'>{ajuan.perihal}</td>
                  <td className='px-4 py-2 border'>{ajuan.isiAjuan}</td>
                  <td className='p-4 text-center w-32'>
                    <span
                      className={`px-2 py-1 rounded text-center w-full inline-block ${
                        ajuan.status === 'Selesai'
                          ? 'bg-green-200 text-green-700'
                          : 'bg-red-200 text-red-700'
                      }`}
                    >
                      {ajuan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal untuk Edit Ajuan */}
      {selectedAjuan && (
        <EditAjuanModal
          isOpen={isModalOpen}
          ajuanData={selectedAjuan}
          onClose={handleModalClose}
          onSave={handleSaveAjuan}
        />
      )}
    </div>
  );
};

export default UserListAjuan;
