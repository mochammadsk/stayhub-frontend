import SectionHeader from '../components/Elements/SectionHeader';
import Profile from '../components/Fragments/Profile';
import TabPilihan from '../components/Fragments/TabPilihan';
import CustomTable from '../components/Elements/CustomTable';
import PopupTambahKamar from '../components/Fragments/PopupTambahKamar';
import PopupEditKamar from '../components/Fragments/PopupEditKamar';
import Button from '../components/Elements/Button';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { IRoomFacility } from '../interfaces/models/RoomFacilityInterface';
import { IRoomType } from '../interfaces/models/RoomTypeInterface';
import { IRoom } from '../interfaces/models/RoomInterface';

const AdminDataKamar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [roomData, setRoomData] = useState<IRoom[]>([]);
  const [typeKamarData, setTypeKamarData] = useState<IRoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<IRoom | null>(null);

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) {
      alert('Unauthorized!');
      return;
    }

    try {
      setLoading(true);
      const [roomResponse, typeKamarResponse] = await Promise.all([
        axios.get('https://stayhub-api.vercel.app/room', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('https://stayhub-api.vercel.app/type', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      const formattedRooms = roomResponse.data.data.map((room: IRoom) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        status: room.status,
        images: room.images,
      }));

      const formattedTypeKamar = typeKamarResponse.data.data.map(
        (type: IRoomType) => ({
          id: type.id,

          name: type.name,

          facility: type.facility.map((fasilitas: IRoomFacility) => ({
            name: fasilitas.name,
          })) as IRoomFacility[],

          description: type.description,

          cost: type.cost,
        })
      );

      setRoomData(formattedRooms);
      setTypeKamarData(formattedTypeKamar);

      // Ensure activeTab is valid
      if (activeTab !== 'all') {
        const isValidTab = formattedTypeKamar.some(
          (type: IRoomType) => type.name === activeTab
        );
        if (!isValidTab) {
          setActiveTab('all');
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
      : roomData.filter((room) => room.type[0].id === activeTab);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
      try {
        await axios.delete(`https://stayhub-api.vercel.app/room/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        fetchData();
        alert('Kamar berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const roomColumns = ['Nama Kamar', 'Tipe Kamar', 'Status', 'Gambar', 'Aksi'];
  const formatTableData = (data: IRoom[]) =>
    data.map((room) => ({
      'Nama Kamar': room.name,
      'Tipe Kamar': room.type[0].name,
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
      <SectionHeader title='Data Kamar'>
        <Profile />
      </SectionHeader>

      <TabPilihan
        onAddButtonClick={() => setIsPopupOpen(true)}
        addButtonLabel='Tambah Kamar'
      />

      {loading ? (
        <div className='flex justify-center items-center'>
          <div className='w-16 h-16 border-4 border-gray-300 border-t-primary rounded-full animate-spin'></div>
          <p className='ml-4 text-lg font-semibold text-primary'>Loading...</p>
        </div>
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
