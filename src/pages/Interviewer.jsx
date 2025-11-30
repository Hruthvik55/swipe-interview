import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Table, Card, Button, Tag, Collapse, Typography, Space } from 'antd'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { deleteCandidate } from '../slices/sessionSlice'

const { Text } = Typography
const { Panel } = Collapse

const Interviewer = () => {
  const candidates = useSelector((state) => state.session.candidates || [])
  const dispatch = useDispatch()

  const handleDelete = (index) => {
    dispatch(deleteCandidate(index))
  }

  const getScoreTag = (score) => {
    if (score >= 70) return <Tag color="green">Excellent ({score})</Tag>
    if (score >= 40) return <Tag color="gold">Average ({score})</Tag>
    return <Tag color="red">Needs Improvement ({score})</Tag>
  }

  const columns = [
    { title: ' Name', dataIndex: 'name', key: 'name' },
    { title: ' Email', dataIndex: 'email', key: 'email' },
    { title: ' Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => getScoreTag(score),
    },
    {
      title: ' Actions',
      key: 'actions',
      render: (_, __, index) => (
        <Space>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(index)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 20 }}>
      <Card title="📊 Candidates Dashboard" bordered={false}>
        <Table
          dataSource={candidates.map((c, i) => ({ ...c, key: i }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
          expandable={{
            expandedRowRender: (record) => (
              <Collapse accordion>
                {record.answers?.map((ans, idx) => (
                  <Panel
                    header={`Q${idx + 1}: ${ans.q}`}
                    key={idx}
                    extra={<Tag color="blue">{ans.type.toUpperCase()}</Tag>}
                  >
                    <p>
                      <Text strong>Answer:</Text> {ans.a}
                    </p>
                    <p>
                      <Text strong>Score:</Text>{' '}
                      <Tag color="purple">
                        {ans.score} /{' '}
                        {ans.type === 'easy'
                          ? 10
                          : ans.type === 'medium'
                          ? 20
                          : 30}
                      </Tag>
                    </p>
                  </Panel>
                ))}
              </Collapse>
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default Interviewer
