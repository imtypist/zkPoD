import hashlib
import os
import time
import linecache
from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.utils import write_signature_for_zokrates_cli

def generate_inputs(data_len):
    # Seeded for debug purpose
    key = FQ(1997011358982923168928344992199991480689546837621580239342656433234255379025)
    sk = PrivateKey(key)

    pk = PublicKey.from_private(sk)

    inputs = [i for i in range(data_len)]

    path = 'zokrates_inputs.txt'
    keys = [pk.p.x.n, pk.p.y.n, sk.fe.n]
    # Fix the hash of the last block to 0x00000000000000010000000200000003000000040000000500000006...(512 bits) for debug purpose
    args = " ".join(map(str, keys)) + " " + " ".join(map(str, inputs)) + " 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
    return args


def micro_test(data_len, iteration = 10):
    # replace DATA_LEN in zkPoD.zok
    with open("zkPoD_template.zok", "r") as f:
        data = f.read().replace("DATA_LEN", str(data_len))
        with open("zkPoD.zok", "w+") as file:
            file.write(data)

    print("data length: %s" % data_len)

    # compile circuit
    os.system("zokrates compile -i zkPoD.zok -o zkPoD --light > compile.out")
    linecache.updatecache("compile.out")
    constraints = linecache.getline("compile.out", 4).split(":")[1].strip()
    print("# of constraints: %s" % constraints)

    # GenParam
    st = time.perf_counter()
    for i in range(iteration):
        os.system("zokrates setup -i zkPoD --light > setup.out")
    ed = time.perf_counter()
    linecache.updatecache("setup.out")
    points = linecache.getline("setup.out", 3).split(" ")[2].strip()
    print("# of points: %s" % points)
    print("GenParam: %s ms" % ((ed - st) * 1000 / iteration))
    genparam = (ed - st) * 1000 / iteration

    # ProveData
    args = generate_inputs(data_len)
    st = time.perf_counter()
    for i in range(iteration):
        os.system("zokrates compute-witness -i zkPoD -a " + args + " --light > witness.out && zokrates generate-proof -i zkPoD > proof.out")
    ed = time.perf_counter()
    print("ProveData: %s ms" % ((ed - st) * 1000 / iteration))
    provedata = (ed - st) * 1000 / iteration

    # VerifyProof
    st = time.perf_counter()
    for i in range(iteration):
        os.system("zokrates verify > verify.out")
        # 512bits -> 64 bytes, simulate the operation of calculating hash of the last block, '8e6245e107a0127f17e480ba65f27e20ac48d13f15eedc93b716eb2806701f7d'
        sha2 = hashlib.sha256(b'0000000100020003000400050006000700080009001000110012001300140015').hexdigest()
    ed = time.perf_counter()
    print("VerifyProof: %s ms\n" % ((ed - st) * 1000 / iteration))
    verifyproof = (ed - st) * 1000 / iteration

    logs = [data_len, constraints, points, genparam, provedata, verifyproof]
    return ",".join(map(str, logs))


if __name__ == "__main__":
    iteration = 3
    f = open("micro_test_iter" + str(iteration) + ".csv", "w+")
    f.write("data_len,constraints,points,genparam,provedata,verifyproof\n")
    for data_len in range(10, 601, 10):
        f.write(micro_test(data_len, iteration) + "\n")
    f.close()
    