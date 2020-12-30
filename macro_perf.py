from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
import hashlib
import math
import time
import random

# parameters that hardcoded in the genesis block
MIN_WORKLOAD = 300e3
DELTA_TIME = 10 # s
# calculated according to micro_test.csv, there is a linear relationship between constraints and provedata
RUNNING_TIME_PER_CONSTRAINT = 0.03749e-3 # s

# height of blockchain starts from 1
blockchain = []

class Miner(object):
	def __init__(self, identifier):
		super(Miner, self).__init__()
		self.id = identifier
		self.sk = PrivateKey.from_rand()
		self.pk = PublicKey.from_private(self.sk)
		# self.blockchain = []

	def create_block(self):
		global blockchain
		height = len(blockchain)

		if len(blockchain) == 0:
			concat_str = "this is a genesis block." + str(height + 1) + str(hex(self.pk.p.x.n))[2:] + str(hex(self.pk.p.y.n))[2:]
		else:
			pre_block = blockchain[-1]
			concat_str = pre_block["hash"] + str(height + 1) + str(hex(self.pk.p.x.n))[2:] + str(hex(self.pk.p.y.n))[2:]

		if len(blockchain) <= 1:
			local_mean = 100e3
		else:
			local_mean = int(pre_block['local_mean'] * DELTA_TIME / (pre_block["ts"] - blockchain[-2]["ts"])) # int()
		
		tag = hashlib.sha512(concat_str.encode()).hexdigest()
		r = int(tag[-16:], 16) / 0xffffffffffffffff
		workload = MIN_WORKLOAD - local_mean * math.log10(r)
		# simulate prove data
		# print("workload:", workload)
		# print("running time:", RUNNING_TIME_PER_CONSTRAINT*workload, "s")

		rt = RUNNING_TIME_PER_CONSTRAINT*workload + random.uniform(-5,5)
		if len(blockchain) == 0:
			ts = rt
		else:
			ts = pre_block["ts"] + rt

		new_block = {
			"id": self.id,
			"ts": ts,
			"rt": rt,
			"hash": hashlib.sha256().hexdigest(),
			"workload": workload,
			"local_mean": local_mean,
			"pk" : self.pk,
			"height" : height + 1
		}
		# self.blockchain.append(new_block)
		# print(self.id + ": create_block >>>")
		return new_block

	def check_block(self, new_block):
		if new_block["height"] != (len(blockchain) + 1):
			return

		if new_block["height"] <= 2 and new_block["local_mean"] != 100e3:
			return

		if new_block["height"] == 1:
			concat_str = "this is a genesis block." + str(new_block["height"]) + str(hex(new_block['pk'].p.x.n))[2:] + str(hex(new_block['pk'].p.y.n))[2:]
		else:
			concat_str = new_block["hash"] + str(new_block["height"]) + str(hex(new_block['pk'].p.x.n))[2:] + str(hex(new_block['pk'].p.y.n))[2:]
		tag = hashlib.sha512(concat_str.encode()).hexdigest()
		r = int(tag[-16:], 16) / 0xffffffffffffffff
		workload = MIN_WORKLOAD - new_block['local_mean'] * math.log10(r)
		if workload != new_block["workload"]:
			return

		# self.blockchain.append(new_block)
		print(self.id + ": check_block pass!")
		return

if __name__ == '__main__':
	miners = []
	for i in range(30):
		miners.append(Miner("N" + str(i+1)))

	f = open("macro_test.csv", "w+")
	f.write("height,id,rt,workload,local_mean\n")

	for i in range(100):
		final_block = None

		for m in miners:
			new_block = m.create_block()
			if (final_block is None) or (new_block["rt"] < final_block["rt"]):
				final_block = new_block

		print(final_block["id"] + ": create_block >>>")
		print("height: " + str(final_block["height"]))
		print("Workload: " + str(final_block["workload"]))
		print("local_mean: " + str(final_block["local_mean"]))
		print("Running time: " + str(final_block["rt"]))
		args = [final_block["height"],final_block["id"],final_block["rt"],final_block["workload"],final_block["local_mean"]]
		f.write(",".join(map(str,args)) + "\n")

		blockchain.append(final_block)

	f.close()