import ProfileAdmin from '../components/Fragments/ProfileAdmin';
import TabPilihan from '../components/Fragments/TabPilihan';
import CustomTable from '../components/Elements/CustomTable';
import PopupTambahKamar from '../components/Fragments/PopupTambahKamar';
import PopupEditKamar from '../components/Fragments/PopupEditKamar';
import Button from '../components/Elements/Button';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Interface data room
interface Room {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  status: string;
  images: { url: string; filename: string }[];
}

// Interface data type kamar
interface TypeKamar {
  id: string;
  name: string;
  facility: { name: string }[];
  description: string;
  cost: number;
}

const AdminDataKamar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [roomData, setRoomData] = useState<Room[]>([]);
  const [typeKamarData, setTypeKamarData] = useState<TypeKamar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) {
      alert('Unauthorized!');
      return;
    }

    try {
      setLoading(true);
      const [roomResponse, typeKamarResponse] = await Promise.all([
        axios.get('http://localhost:8000/room', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('http://localhost:8000/type', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      const formattedRooms = roomResponse.data.data.map((room: Room) => ({
        id: room.id,
        name: room.name,
        type: room.type[0],
        status: room.status,
        images: room.images,
      }));

      const formattedTypeKamar = typeKamarResponse.data.data.map(
        (type: any) => ({
          id: type.id,

          name: type.name,

          facility: type.facility.map((fasilitas: any) => ({
            name: fasilitas.name,
          })),

          description: type.description,

          cost: type.cost,
        })
      );

      setRoomData(formattedRooms);
      setTypeKamarData(formattedTypeKamar);

      // Ensure activeTab is valid
      if (activeTab !== 'all') {
        const isValidTab = formattedTypeKamar.some(
          (room) => room.type === activeTab
        );
        if (!isValidTab) {
          setActiveTab('all'); // Reset to 'all' if the current tab is invalid
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRooms =
    activeTab === 'all'
      ? roomData
      : roomData.filter((room) => room.type.id === activeTab);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
      try {
        await axios.delete(`http://localhost:8000/room/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        fetchData();
        alert('Kamar berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert(error.response?.data?.message || 'Gagal menghapus kamar.');
      }
    }
  };
  
  const roomColumns = ['Nama Kamar', 'Tipe Kamar', 'Status', 'Gambar', 'Aksi'];
  const formatTableData = (data: Room[]) =>
    data.map((room) => ({
      'Nama Kamar': room.name,
      'Tipe Kamar': room.type?.name,
      Status: room.status === 'available' ? 'Tersedia' : 'Tidak Tersedia',
      Gambar: (
        <div className='flex gap-2'>
          {room.images.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:8000/${image.url}`}
              alt={`Room ${room.name}`}
              className='w-10 h-10 object-cover rounded'
            />
          ))}
        </div>
      ),
      Aksi: (
        <div className='flex items-center justify-center space-x-2'>
          <Button
            variant='primary'
            onClick={() => {
              setCurrentRoom(room);
              setIsEditPopupOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant='deleted' onClick={() => handleDelete(room.id)}>
            Hapus
          </Button>
        </div>
      ),
    }));

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Data Kamar</h1>
        <ProfileAdmin />
      </div>

      <TabPilihan
        buttons={[
          { label: 'All', value: 'all', variant: 'secondary' },
          ...typeKamarData.map((type) => ({
            label: type.name,
            value: type.id,
            variant: 'secondary',
          })),
        ]}
        activeTab={activeTab}
        onTabClick={setActiveTab}
        onAddButtonClick={() => setIsPopupOpen(true)}
        addButtonLabel='Tambah Kamar'
      />

      {loading ? (
        <p>Loading data kamar...</p>
      ) : (
        <CustomTable
          columns={roomColumns}
          data={formatTableData(filteredRooms)}
          itemsPerPage={5}
        />
      )}

      <PopupTambahKamar
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onKamarAdded={fetchData}
        typeKamarData={typeKamarData}
      />

      <PopupEditKamar
        isOpen={isEditPopupOpen}
        onClose={() => {
          setIsEditPopupOpen(false);
          setCurrentRoom(null);
        }}
        currentData={currentRoom}
        onKamarUpdated={fetchData}
        typeKamarData={typeKamarData}
      />
    </div>
  );
};

export default AdminDataKamar;
