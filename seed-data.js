// Script để seed dữ liệu mẫu vào Firestore
// Chạy script này trong Browser Console sau khi đã load Firebase

async function seedSampleData() {
    try {
        console.log('🌱 Bắt đầu seed dữ liệu mẫu...');
        
        // Seed sample members
        const members = [
            {
                name: 'GS. TS. Nguyễn Văn A',
                role: 'Trưởng nhóm nghiên cứu',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'TS. Trần Thị B', 
                role: 'Nghiên cứu viên chính',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b109?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'NCS. Lê Minh C',
                role: 'Nghiên cứu sinh tiến sĩ',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            },
            {
                name: 'ThS. Phạm Thị D',
                role: 'Nghiên cứu viên',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            }
        ];
        
        for (const member of members) {
            await db.collection('members').add(member);
            console.log(`✅ Đã thêm thành viên: ${member.name}`);
        }
        
        // Seed sample publications
        const publications = [
            {
                title: 'A Novel Consensus Algorithm for IoT-based Blockchain Networks',
                authors: 'Nguyễn Văn A, Trần Thị B, Lê Minh C',
                journal: 'Proceedings of the IEEE International Conference on Communications (ICC)',
                year: 2025,
                abstract: 'This paper introduces a lightweight and energy-efficient consensus algorithm, Proof-of-Activity (PoA), specifically designed for resource-constrained IoT devices. Our proposed algorithm leverages device activity metrics to achieve consensus, significantly reducing computational overhead compared to traditional PoW and PoS systems. Experimental results demonstrate a 40% reduction in energy consumption while maintaining robust security and decentralization.',
                url: 'https://example.com/paper1'
            },
            {
                title: 'Deep Learning-based Intrusion Detection for 5G-enabled Vehicular Networks',
                authors: 'Trần Thị B, Nguyễn Văn A',
                journal: 'IEEE Transactions on Vehicular Technology',
                year: 2024,
                abstract: 'As 5G technology enables new V2X (Vehicle-to-Everything) applications, security becomes a paramount concern. We propose a novel intrusion detection system (IDS) using a hybrid Convolutional-Recurrent Neural Network (CRNN) model. The model is trained on a realistic dataset of network traffic and can accurately detect various attacks, including DDoS and man-in-the-middle, with an F1-score of 98.7%.',
                url: 'https://example.com/paper2'
            },
            {
                title: 'Blockchain-based Supply Chain Transparency using Smart Contracts',
                authors: 'Lê Minh C, Phạm Thị D, Nguyễn Văn A',
                journal: 'Journal of Network and Computer Applications',
                year: 2024,
                abstract: 'Supply chain transparency has become increasingly important for consumer trust and regulatory compliance. This work presents a comprehensive blockchain-based solution using Hyperledger Fabric and smart contracts to ensure end-to-end traceability of products. Our system provides immutable records of product journey from manufacturer to consumer, reducing counterfeiting by 85% in our pilot study.',
                url: 'https://example.com/paper3'
            },
            {
                title: 'Privacy-Preserving Federated Learning for IoT Device Classification',
                authors: 'Phạm Thị D, Trần Thị B',
                journal: 'IEEE Internet of Things Journal',
                year: 2023,
                abstract: 'The proliferation of IoT devices raises significant privacy concerns when implementing centralized machine learning systems. We propose a federated learning framework that enables collaborative model training while preserving individual device privacy. Our approach uses differential privacy and secure aggregation to achieve 94% accuracy in device classification while maintaining strong privacy guarantees.',
                url: 'https://example.com/paper4'
            }
        ];
        
        for (const publication of publications) {
            await db.collection('publications').add(publication);
            console.log(`✅ Đã thêm công bố: ${publication.title}`);
        }
        
        // Seed settings
        await db.collection('settings').doc('general').set({
            notificationEmail: 'admin@example.com',
            siteName: 'Nhóm Nghiên cứu Blockchain, Mạng & Bảo mật',
            contactEmail: 'contact@example.com'
        });
        console.log('✅ Đã thêm cài đặt hệ thống');
        
        console.log('🎉 Hoàn thành seed dữ liệu mẫu!');
        console.log('👉 Bây giờ bạn có thể reload trang để xem dữ liệu mới');
        
    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
    }
}

// Hướng dẫn sử dụng
console.log(`
🚀 HƯỚNG DẪN SEED DỮ LIỆU MẪU

1. Mở website trong trình duyệt
2. Mở Developer Console (F12)
3. Copy và paste toàn bộ nội dung file này vào console
4. Chạy lệnh: seedSampleData()
5. Đợi cho đến khi thấy thông báo hoàn thành
6. Reload trang để xem dữ liệu mới

⚠️  LưuÝ: Đảm bảo Firebase đã được cấu hình đúng trước khi chạy script
`);

// Export function để có thể gọi từ console
window.seedSampleData = seedSampleData;